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

  @Column('text', { array: true, default: [] })
  dayOfWeek: string[]

  @Column('text')
  startTime: string

  @Column('text')
  endTime: string

  @Column('date')
  startDate: string

  @Column('date')
  endDate: string
}

export type ScheduleBare = Omit<DentistSchedule, 'user' | 'appointments'>
export type ScheduleWithUser = ScheduleBare & { user: User }

export const scheduleSchema = validates<ScheduleBare>().with({
  scheduleId: z.number().int().positive(),
  userId: z.number().int().positive(),
  dayOfWeek: z.array(z.string().min(1).max(64)),
  startTime: z.string(),
  endTime: z.string(),
  startDate: z.string(),
  endDate: z.string(),
})

export const scheduleInsertSchema = scheduleSchema.omit({ scheduleId: true })

export type ScheduleInsert = z.infer<typeof scheduleInsertSchema>
