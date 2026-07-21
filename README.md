# CareBloom

CareBloom is a responsive health and wellbeing support platform for young carers. It is a fictional charity application developed for Monash University FIT5032 Internet Applications Development, T3 2026.

The platform helps young carers find wellbeing support, book sessions, join peer support circles, and keep their activity together in a private account. CareBloom does not provide diagnosis, treatment, or emergency crisis support.

## Current A2 implementation

The current application implements the following Vue 3 assignment requirements and supporting user flows:

- **A.1 – Vue.js 3:** component-based application using Vue 3 Composition API and Vite.
- **A.2 – Responsive design:** desktop, tablet, and mobile layouts with responsive navigation and cards.
- **B.1 – Validation:** required fields, email format, password length and composition, matching passwords, and input length limits.
- **B.2 – Dynamic data:** sessions, peer circles, users, bookings, and ratings are rendered from Vue state and persisted in Local Storage.
- **C.1 – Authentication:** registration, login, logout, multiple accounts, and persistent login state.
- **C.2 – Role-based authentication:** `user` and `admin` roles with protected account and admin routes.
- **Supporting flow:** users can create and cancel session bookings, join peer circles, and view their activity in My Account.

Aggregated rating submission (C.3) and the remaining security review (C.4) are planned for later stages. Rating records already exist in the data model, but the rating interface is not yet implemented.

## Technology

- Vue 3
- Vue Router 4
- Vite
- JavaScript ES modules
- CSS with custom responsive breakpoints
- Browser Local Storage
- Web Crypto API for salted password digests

No backend or cloud database is used in this A2 prototype.

## Install and run

Requirements:

- Node.js
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite, normally `http://localhost:5173/`.

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Fictional test accounts

Young carer account:

```text
Email: mia.chen@example.org
Password: CareBloom1!
Role: user
```

Charity staff account:

```text
Email: priya.nair@example.org
Password: CareBloomAdmin1!
Role: admin
```

The Login page also provides buttons that fill these fictional demo credentials.

## Routes and access control

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Home | Public |
| `/about` | Information about young carers | Public |
| `/support` | Nearby support placeholder | Public |
| `/sessions` | Browse and book support sessions | Public browsing; user account required to book |
| `/community` | Browse and join peer circles | Public browsing; user account required to join |
| `/register` | Create an account | Guests only |
| `/login` | Log in | Guests only |
| `/account` | Profile, My Bookings, and joined circles | Authenticated users |
| `/admin` | Charity staff dashboard | Admin only |
| `/forbidden` | Access denied response | Public response page |

Access to `/account` and `/admin` is enforced by a global Vue Router guard. Navigation visibility is an additional interface measure and is not used as the access-control mechanism.

## Data model and persistence

The main data collections are:

- `users`
- `supportSessions`
- `peerCircles`
- `bookings`
- `ratings`

Peer-circle memberships are stored in each user's `joinedCircleIds` array. Active session reservations are stored as booking records with a `confirmed` status; cancellation changes the record to `cancelled` rather than deleting it.

Local Storage keys:

```text
carebloom:data:v3
carebloom:auth:v1
```

The storage service automatically initialises default data, recovers from invalid stored data, and migrates compatible v1/v2 data into v3.

## Booking and peer-circle checks

Data-store actions enforce the following rules:

- Only `user` accounts can book sessions or join peer circles.
- A user cannot hold two confirmed bookings for the same session.
- A user cannot join the same peer circle twice.
- Full sessions and circles reject new activity.
- Users can cancel only bookings belonging to their own account.
- Cancelled sessions can be booked again if capacity remains.

Suggested manual test:

1. Log in with the Mia demo account.
2. Open Sessions and book an available session.
3. Try the same session again; the interface should display `Booked` and the store rejects duplicates.
4. Open Peer Community and join a circle not already joined.
5. Open My Account to view both records.
6. Cancel the booking and confirm it disappears from active My Bookings.
7. Refresh the browser and confirm the remaining activity persists.

## Project structure

```text
src/
  components/     Shared header and footer
  data/           Fictional default data
  router/         Routes and role-based access policy
  services/       Storage and authentication utilities
  stores/         Reactive application and authentication state
  utils/          Form validation rules
  views/          Route-level pages
```

## Security limitations

This is a client-side course prototype. Passwords are stored as salted one-way digests rather than plain text, user input is rendered with Vue text interpolation, and protected routes check authentication and role state. However, Local Storage and client-side roles can be modified by a browser user and are not production-grade security boundaries.

A later version can replace the local authentication and data layer with Firebase Authentication, Firestore security rules, and server-side authorisation.
