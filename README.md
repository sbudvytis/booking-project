## Dentist scheduler application

<p align="center">
<img src="https://github.com/TuringCollegeSubmissions/sbudvy-BE.3.5/client/src/assets/preview.png">
</p>

This is a scheduler application designed for dentists to manage their time, appointments and schedules. Potential users are dental clinics
where dentists and staff members work together to manage their appointments and patient data. Users can sign up and choose a role, which
which includes different permissions.

## Features

- Users can create an account and choose a role (dentist or staff) and then log in.
- Each role has different permissions.
  - Dentist role can:
    - Create and manage their schedules.
    - Create and manage their appointments.
    - View previous schedules with their appointments.
    - Manage patient data.
  - Potential staff role features that are not implemented yet:
    - Can see all the schedules created by dentists.
    - Can create and manage appointments to a specific dentist.
    - Can view previous schedules created by dentists.
  - Staff role cannot:
    - Create and manage schedules.
- When appointment created, users can see all of the info at glance (patient data, appointment data)
- If appointment created successfully, patient will get an email with appointment details.
- Schedule ends the day after last day of schedule. Then, user can create a new schedule and old schedule
  appears in `View previous schedules` section.

## Setup

1. Clone the repository or download the source code files:

```bash
git clone https://github.com/TuringCollegeSubmissions/sbudvy-BE.3.5.git
```

2. Install all the packages:

```bash
npm install
```

3. This project uses postgreSQL database, so you must create one named `bookings`.

4. Setup `.env` files in `client` and `server` based on `.env.example` files.

## Running the server

In development mode:

```bash
npm run dev
```

## Running the client

In development mode:

```bash
npm run dev
```

## Tests

```bash

# front end unit tests
npm run test:unit -w client

# front end E2E tests
npm run test:e2e -w client

# back end tests with an in-memory database
npm test -w server
```

## Auto email send

If you want to test this feature, where user can send an automated email when appointment created, you must provide your email credentials:

```bash
host: 'your email provider',
port: port (usualy 465),
auth: {
  user: email address,
  pass: password,
}
```

## Work in progress features

- Staff members can select specific schedule created by the dentist and make an appointment.
- Pagination in `View previous schedules` section.
- If schedule is longer than 7 days, scrollable tabs should appear in Dashboard.
- Profile manager, where user can change their password, update contact info.
- Updated Dashboard view with more info.
- Front-end testing (because current front-end part may change)
- And many more... :).
