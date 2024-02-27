import { validates } from '@server/utils/validation'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { z } from 'zod'
import { User } from './user'
import { Appointment } from './appointment'

@Entity()
export class DentistSchedule {
  @PrimaryGeneratedColumn('increment')
  scheduleId: number

  @Column('integer')
  userId: number

  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn()
  user: User

  @OneToMany(() => Appointment, (appointment) => appointment.schedule, {
    cascade: ['insert'],
  })
  appointments: Appointment[]

  @Column('text')
  startTime: string

  @Column('text')
  endTime: string

  @Column('timestamp')
  startDate: Date

  @Column('timestamp')
  endDate: Date
}

export type ScheduleBare = Omit<DentistSchedule, 'user' | 'appointments'>
export type ScheduleWithUser = ScheduleBare & { user: User }

export const scheduleSchema = validates<ScheduleBare>().with({
  scheduleId: z.number().int().positive(),
  userId: z.number().int().positive(),
  startTime: z.string(),
  endTime: z.string(),
  startDate: z.date(),
  endDate: z.date(),
})

export const scheduleInsertSchema = scheduleSchema.omit({ scheduleId: true })

export type ScheduleInsert = z.infer<typeof scheduleInsertSchema>
