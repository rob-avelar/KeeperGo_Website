export type UserRole = 'ORGANIZER' | 'GOALKEEPER' | 'ADMIN'

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'

export type FieldType = 'GRASS' | 'ARTIFICIAL' | 'FUTSAL' | 'INDOOR'

export type WarningLevel = 'NONE' | 'LIGHT' | 'MODERATE' | 'SEVERE' | 'CRITICAL'

export interface GoalkeeperProfile {
  id: string
  userId: string
  isActive: boolean
  averageRating: number | null
  totalMatches: number
  warningCount: number
  blockedUntil: string | null
  bio: string | null
  city: string | null
  stripeAccountId: string | null
  stripeAccountStatus: string | null
}

export interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  roles: UserRole[]
  image: string | null
  goalkeeperProfile?: GoalkeeperProfile | null
  goalkeeperBookings?: Booking[]
  organizerBookings?: Booking[]
}

export interface Booking {
  id: string
  organizerId: string
  goalkeeperId: string | null
  goalkeeperProfileId: string | null
  date: string
  duration: number
  location: string
  latitude: number | null
  longitude: number | null
  fieldType: FieldType
  pricePerHour: number
  totalAmount: number
  specialRequests: string | null
  status: BookingStatus
  goalkeeperConfirmedAt: string | null
  confirmedAt: string | null
  confirmationDeadline: string | null
  noShow: boolean
  isCompleted: boolean
  createdAt: string
  organizer?: Pick<User, 'id' | 'name' | 'email'>
  goalkeeper?: Pick<User, 'id' | 'name' | 'email'>
  goalkeeperProfile?: Pick<GoalkeeperProfile, 'id' | 'averageRating' | 'totalMatches'>
  ratings?: Rating[]
  payments?: Payment[]
}

export interface Rating {
  id: string
  bookingId: string
  raterId: string
  rateeId: string
  punctuality: number
  attitude: number
  technicalSkill: number
  overallRating: number
  comment: string | null
  createdAt: string
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  currency: string
  status: string
  stripePaymentIntentId: string | null
  createdAt: string
}

export interface CancellationPreview {
  warningLevel: WarningLevel
  goalkeeperEarnings: number
  message: string
}
