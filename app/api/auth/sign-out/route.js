import { cookies } from "next/headers";

export async function POST() {
    cookies().delete("session_token");
    return Response.json({ message: "Signed out" }, { status: 200 });
}
