import { Metadata } from "next";
import ProfileForm from "./profile-form";

export const metadata: Metadata = {
  title: "Customer Profile",
};

export default async function ProfilePage() {
  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="h2-bold">
          <ProfileForm />
        </h2>
      </div>
    </>
  );
}
