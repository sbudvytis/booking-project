/* eslint-disable no-console */
import {
  Appointment,
  appointmentInsertSchema,
} from '@server/entities/appointment'
import { Patient } from '@server/entities/patient'
import { DentistSchedule } from '@server/entities/dentistSchedule'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { TRPCError } from '@trpc/server'
import nodemailer from 'nodemailer'

export default authenticatedProcedure
  .input(appointmentInsertSchema.omit({ userId: true }))
  .mutation(async ({ input: appointmentData, ctx: { authUser, db } }) => {
    const userPermissions = authUser.permissions || []
    const userRole = authUser.role || ''

    // Check if the user has the required permission to add an appointment
    const canCreateAppointment =
      userRole === 'dentist' || userPermissions.includes('VIEW_ALL_SCHEDULES')

    if (!authUser || !canCreateAppointment) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'Permission denied. You do not have the required role or permissions to add an appointment.',
      })
    }

    // Check if the patient data is provided
    if (!appointmentData.patientData) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Patient data is required for creating an appointment.',
      })
    }

    // Check if a patient with the same email already exists in the database
    let patient = await db.getRepository(Patient).findOne({
      where: { email: appointmentData.patientData.email },
    })

    if (!patient) {
      // If the patient does not exist, create a new one
      patient = db.getRepository(Patient).create(appointmentData.patientData)
      patient = await db.getRepository(Patient).save(patient)
    }

    const dentistSchedule = await db
      .getRepository(DentistSchedule)
      .createQueryBuilder('DentistSchedule')
      .innerJoinAndSelect('DentistSchedule.user', 'user')
      .where(':appointmentDay = ANY("DentistSchedule"."day_of_week")', {
        appointmentDay: appointmentData.appointmentDay,
      })
      .andWhere('user.id = :userId', { userId: authUser.id })
      .andWhere('DentistSchedule.endDate > :currentDate', {
        currentDate: new Date(),
      })
      .getOne()

    if (!dentistSchedule) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Dentist schedule not found.',
      })
    }

    // Create an appointment and assign it to the patient
    const appointment = db.getRepository(Appointment).create({
      ...appointmentData,
      userId: authUser.id,
      patient,
      schedule: dentistSchedule,
    })

    const appointmentCreated = await db
      .getRepository(Appointment)
      .save(appointment)

    // Send email
    setImmediate(async () => {
      const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
        authMethod: 'PLAIN',
      })

      try {
        const info = await transporter.sendMail({
          from: `"Dentist scheduler" ${process.env.EMAIL}`,
          to: appointmentData.email,
          subject: 'New Appointment',
          html: `
            <h1>Appointment Details</h1>
            <p><strong>Scheduled for:</strong> ${appointmentCreated.appointmentType}</p>
            <p><strong>Day:</strong> ${appointmentCreated.appointmentDay}</p>
            <p><strong>Start Time:</strong> ${appointmentCreated.startTime}</p>
            <p><strong>End Time:</strong> ${appointmentCreated.endTime}</p>
          `,
        })
        console.log('Message sent: %s', info.messageId)
      } catch (error) {
        console.error('Error sending email:', error)
      }
    })

    return appointmentCreated
  })
