# Security Specification - Cuatro Patitas Firestore Implementation

This document defines the zero-trust data access control configuration, invariant rules, and security assertions for the "Cuatro Patitas" Firestore collections.

## 1. Core Data Invariants

1. **Pets Collection (`/pets/{petId}`)**
   - **Public Access**: Any visitor can view (read/list) available pets to facilitate adoption.
   - **Admin Only Updates**: Only verified administrators can create, update, or delete pets.
   - **Status Validation**: A pet's status must be one of `En adopción`, `Adoptado`, or `Recuperándose`.

2. **Castration Campaigns (`/campaigns/{campaignId}`)**
   - **Public Access**: Anyone can read/list campaigns to find open slots.
   - **Admin Only Updates**: Only verified admins can create, delete, or modify campaigns.
   - **Slot Integity**: Total registered count can only be incremented or decremented.

3. **Castration Appointments (`/appointments/{appointmentId}`)**
   - **Creation**: Anyone can submit an appointment registration (create) to block slots. Must register as `Pendiente`.
   - **Security Filters on List**: Standard users can only list appointments if they are querying explicitly by their own verified `ownerDni` (limited to 20 results) to prevent data mining/scraping.
   - **Action-Based Updates**: Users cannot update appointments. Admins can update any field (e.g., set status to `Aprobado` or `Rechazado` and attach coordination remarks).

4. **Adoption Applications (`/adoptions/{adoptionId}`)**
   - **Creation**: Anyone can submit an adoption application (create). Must register as `Pendiente`.
   - **Security Filters on List**: Standard users can only list adoptions if they filter by their own verified `adopterDni` to prevent stalking or private info disclosure.
   - **Action-Based Updates**: Users cannot update adoptions after submitting them (immutability). Admins can update status and attach evaluation remarks.

5. **Testimonials (`/testimonials/{testimonialId}`)**
   - **Public Access**: Anyone can view (read/list) happy ending testimonials.
   - **Creation**: Anyone can create a testimonial (when their adoption is approved, or manually), but admins control official management. Or testimonials are generated in the app structure. Let's allow public create and admin update/delete.

---

## 2. The "Dirty Dozen" Payloads (Agressor Vectors)

The following malicious payloads seek to break the system boundaries. Each must return `PERMISSION_DENIED`.

### Vector 1: Admin Role Spoofing (Identity Escalation)
An unauthenticated user attempts to create a Pet, pretending to be an admin.
- **Payload**: `POST /pets/malicious_pet_1`
- **Body**: `{ "name": "Fake", "breed": "Mix", "age": "2yo", "size": "Mediano", "gender": "Macho", "status": "En adopción", "photo": "...", "addedAt": "2026-05-20" }`
- **Security Expectation**: Rejected because request is not from a verified admin document.

### Vector 2: Self-Approved Castration Slot
A client submits an appointment with status already established as `Aprobado`.
- **Payload**: `POST /appointments/mishandle_1`
- **Body**: `{ "id": "mishandle_1", "campaignId": "camp_1", "campaignDate": "June 15", "ownerName": "Attacker", "ownerDni": "111", "status": "Aprobado", "createdAt": "2026-05-20" }`
- **Security Expectation**: Rejected. New appointments must have status `Pendiente` only.

### Vector 3: Massive Over-sized ID Injection
Attacker sends a 10KB string as an ID representing a pet, causing bloated database charges.
- **Payload**: `POST /pets/very_long_invalid_id_longer_than_128_chars...`
- **Security Expectation**: Rejected by `isValidId()` check.

### Vector 4: Adoptions Harvesting (Bulk Scraping)
An attacker queries the entire `/adoptions` list without passing their own DNI filter.
- **Payload**: `GET /adoptions`
- **Security Expectation**: Rejected. Blanket lists without filtering `adopterDni` are barred.

### Vector 5: Tampering with Immutable Campaign ID
Attacker attempts to change the associated campaign ID in an existing appointment.
- **Payload**: `PATCH /appointments/turno_1`
- **Body**: `{ "campaignId": "camp_malicious_switched" }`
- **Security Expectation**: Rejected. Only admins can execute updates. Standard users cannot update appointments.

### Vector 6: Arbitrary Value Poisoning (Invalid Status)
Admin or user attempts to set Pet status to an unsupported keyword (e.g. `is_sold`).
- **Payload**: `PATCH /pets/pet_1`
- **Body**: `{ "status": "Vendido" }`
- **Security Expectation**: Rejected. Validation helper restricts status check to `En adopción`, `Adoptado`, or `Recuperándose`.

### Vector 7: Underage Adoption Agreement Spoof
An adoption submission is made where the `agreement` flag is `false` or missing but submitted anyway.
- **Payload**: `POST /adoptions/adop_fake`
- **Body**: `{ "answers": { "agreement": false } }`
- **Security Expectation**: Rejected. Schema validation requires `agreement` to be `true`.

### Vector 8: Time Travel Attack (Spurious Creation Timestamp)
Attacker registers a castration appointment with the `createdAt` field set to a date in the distant future.
- **Payload**: `POST /appointments/past_t_1`
- **Body**: `{ "createdAt": "2030-12-31" }`
- **Security Expectation**: Locked by temporal integrity checks compared to server timestamps (`request.time`).

### Vector 9: Orphaned Appointment (Invalid Campaign reference)
Attacker submits an appointment for a campaign ID that does not exist in the database.
- **Payload**: `POST /appointments/orphan_1`
- **Body**: `{ "campaignId": "non_existent_campaign" }`
- **Security Expectation**: Rejected by `exists()` validation on relational schema mapping.

### Vector 10: State Locking Shortcut (Closing Testimonials)
Attacker edits a published testimonial to display vulgar or altered copy.
- **Payload**: `PATCH /testimonials/test_1`
- **Body**: `{ "story": "De-faced testimonial content" }`
- **Security Expectation**: Rejected. Testimonials are read-only for public, and only fully authenticated admins can update or delete them.

### Vector 11: Shadow PII Harvesting in Pet Collection
An attacker tries to append owner phone, email, and social numbers as arbitrary fields in a public Pet document.
- **Payload**: `POST /pets/shadow_pet_1`
- **Body**: `{ "ownerPhonePrivate": "12345", "name": "Shadow" }`
- **Security Expectation**: Rejected by strict map affectedKeys and exact property matching.

### Vector 12: Fraudulent Campaign Slot Increment
Client directly patches the registration statistics on a campaign document without passing through appointment validation.
- **Payload**: `PATCH /campaigns/camp_1`
- **Body**: `{ "totalRegistered": 100 }`
- **Security Expectation**: Rejected. Only admins can edit campaigns.

---

## 3. Test Runner Design (`firestore.rules.test.ts`)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "chrome-agility-wmvz5",
    firestore: {
      rules: require("fs").readFileSync("firestore.rules", "utf8")
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Cuatro Patitas Zero-Trust Hardening", () => {
  test("Vector 1: Anonymous users cannot write to /pets", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(unauthedDb, "pets/pet_test"), {
      id: "pet_test",
      name: "Firulais",
      breed: "Mestizo",
      age: "2 years",
      size: "Mediano",
      gender: "Macho",
      description: "A lovely puppy",
      status: "En adopción",
      photo: "https://foo.png",
      addedAt: "2026-05-20"
    }));
  });

  test("Vector 2: New submittals are forced to Status = Pendiente", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(db, "appointments/appt1"), {
      id: "appt1",
      campaignId: "camp_1",
      campaignDate: "June 15",
      ownerName: "Alice",
      ownerEmail: "alice@gmail.com",
      ownerDni: "12345",
      ownerPhone: "555-5555",
      petName: "Luna",
      petType: "Gato",
      petAge: "1",
      petWeight: "3",
      status: "Aprobado", // INVALID ON CREATE
      createdAt: "2026-05-20"
    }));
  });

  test("Vector 4: Cannot bulk search appointments without passing ownerDni filter", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const apptsCol = collection(db, "appointments");
    await assertFails(getDocs(apptsCol)); // No query filters
  });
});
```
