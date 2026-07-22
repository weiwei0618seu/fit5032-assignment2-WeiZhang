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
- **C.3 - Aggregated rating:** authenticated users can submit and update 1-5 ratings for peer circles; averages and rating counts are calculated dynamically.
- **Supporting flow:** users can create and cancel session bookings, join peer circles, and view their activity in My Account.
- **Admin Dashboard:** charity staff can review user role distribution, booking records, peer-circle participation, and aggregated rating data.

The remaining security review (C.4) is planned for a later stage.

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
| `/community` | Browse, join, and rate peer circles | Public browsing; authenticated accounts can rate; user role required to join |
| `/register` | Create an account | Guests only |
| `/login` | Log in | Guests only |
| `/account` | Profile, My Bookings, joined circles, and submitted ratings | Authenticated users |
| `/admin` | Read-only users, bookings, circle participation, and ratings dashboard | Admin only |
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

## Booking, peer-circle, and rating checks

Data-store actions enforce the following rules:

- Only `user` accounts can book sessions or join peer circles.
- A user cannot hold two confirmed bookings for the same session.
- A user cannot join the same peer circle twice.
- Full sessions and circles reject new activity.
- Users can cancel only bookings belonging to their own account.
- Cancelled sessions can be booked again if capacity remains.
- Visitors can view rating summaries, but only authenticated accounts can submit ratings.
- Ratings must be whole numbers from 1 to 5.
- A rating is uniquely identified by `userId + targetType + targetId`.
- Submitting another score for the same target updates the existing rating instead of creating a duplicate.
- Average scores and rating counts are derived from the current rating records.
- A peer circle with no ratings displays an explicit empty state.

Suggested manual test:

1. Log in with the Mia demo account.
2. Open Sessions and book an available session.
3. Try the same session again; the interface should display `Booked` and the store rejects duplicates.
4. Open Peer Community and join a circle not already joined.
5. Open My Account to view both records.
6. Cancel the booking and confirm it disappears from active My Bookings.
7. Refresh the browser and confirm the remaining activity persists.
8. While logged in, rate a peer circle that displays `No ratings yet`.
9. Change the score and confirm the rating count stays the same while the average changes.
10. Open My Account and confirm the latest score appears under Ratings shared.
11. Log out and confirm rating summaries remain visible but the page asks the visitor to log in before rating.

## Admin dashboard

The stage 7 dashboard is intentionally read-only. It derives all values from the same Vue state and Local Storage data used by the public and account pages, including:

- registered user totals and `user` / `admin` role distribution;
- confirmed and cancelled booking records joined with fictional user and session data;
- peer-circle membership totals, capacity, remaining places, and registered account members;
- average rating, rating count, number of rated circles, and per-circle empty rating states.

Suggested access-control and dashboard test:

1. While logged out, enter `/admin`; the router should redirect to Login with `/admin` retained as the safe destination.
2. Log in with the Mia young carer account and enter `/admin`; the router should redirect to Access Denied.
3. Log in with the Priya charity staff account; Admin Dashboard should be available from the navigation.
4. Compare the dashboard totals and records with Sessions, Peer Community, and the fictional default data.
5. Resize the dashboard at desktop, tablet, and mobile widths and confirm every record remains readable without page-level horizontal scrolling.

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
