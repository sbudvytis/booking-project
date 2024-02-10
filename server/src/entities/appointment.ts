import { validates } from '@server/utils/validation'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { z } from 'zod'
import {
  Patient,
  patientInsertSchema,
  patientSchema,
  type PatientBare,
} from './patient'
import { User } from './user'
import { DentistSchedule } from './dentistSchedule'

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column('integer')
  userId: number

  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn()
  user: User

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient

  @ManyToOne(() => DentistSchedule, (schedule) => schedule.appointments)
  @JoinColumn({ name: 'schedule_id' })
  schedule: DentistSchedule

  @Column('text')
  appointmentType: string

  @Column('text')
  appointmentDay: string

  @Column('text')
  startTime: string

  @Column('text')
  endTime: string

  @Column('text')
  status: string

  @Column('text', { nullable: true })
  notes: string

  @Column('text')
  email: string
}

export type AppointmentBare = Omit<
  Appointment,
  'user' | 'patient' | 'schedule'
> & {
  patient?: PatientBare
}

export const appointmentSchema = validates<AppointmentBare>().with({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  appointmentType: z.string().trim().min(2).max(100),
  appointmentDay: z.string().trim().min(2).max(100),
  startTime: z.string(),
  endTime: z.string(),
  status: z.string().trim().min(2).max(100),
  notes: z.string().trim().min(2).max(100),
  email: z.string().trim().min(2).max(64),
  patient: patientSchema.optional(),
})

export const appointmentInsertSchema = appointmentSchema
  .omit({
    id: true,
  })
  .extend({
    patientData: patientInsertSchema,
    scheduleId: z.number().int().positive(),
  })

export type AppointmenttInsert = z.infer<typeof appointmentInsertSchema>
