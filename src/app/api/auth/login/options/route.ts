import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { rpID, setPendingLogin } from "@/lib/webauthn";

// Usernameless (discoverable-credential) login: no allowCredentials, so the
// browser just asks "which of this site's passkeys do you want to use?"
// and Face ID handles the rest.
export async function POST() {
  const options = await generateAuthenticationOptions({
    rpID: rpID(),
    userVerification: "required",
  });

  await setPendingLogin(options.challenge);

  return NextResponse.json(options);
}
