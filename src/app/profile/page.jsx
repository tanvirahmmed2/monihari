import { cookies } from "next/headers";
import React from "react";

const Profile = async () => {
  let user = null;

  try {
    const token = (await cookies()).get("user_token")?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/profile`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: `user_token=${token}`,
      },
    });

    const data = await res.json();
    user = data.payload;
  } catch (error) {
    console.log(error);
  }

  return (
    <div>
      <h1>Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

export default Profile;
