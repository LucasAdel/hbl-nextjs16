import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/admin-auth";

// GET /api/admin/users - List all users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Verify user has MANAGE_USERS permission (admin only)
    const auth = await requirePermission(PERMISSIONS.MANAGE_USERS);
    if (!auth.authorized) {
      return auth.response;
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";

    // Use service role to list users
    const serviceClient = createServiceRoleClient();

    const { data: authUsers, error: listError } = await serviceClient.auth.admin.listUsers({
      page: page,
      perPage: pageSize,
    });

    if (listError) {
      console.error("List users error:", listError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    // Transform and filter users
    let users = authUsers.users.map((user) => ({
      id: user.id,
      email: user.email || "",
      role: user.user_metadata?.role || "client",
      firstName: user.user_metadata?.first_name,
      lastName: user.user_metadata?.last_name,
      emailConfirmedAt: user.email_confirmed_at,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
    }));

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (role !== "all") {
      users = users.filter((user) => user.role === role);
    }

    return NextResponse.json({
      users,
      total: authUsers.users.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify user has MANAGE_USERS permission (admin only)
    const auth = await requirePermission(PERMISSIONS.MANAGE_USERS);
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { email, password, firstName, lastName, role } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Use service role to create user
    const serviceClient = createServiceRoleClient();

    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: role || "client",
      },
    });

    if (createError) {
      console.error("Create user error:", createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        role: newUser.user.user_metadata?.role,
        firstName: newUser.user.user_metadata?.first_name,
        lastName: newUser.user.user_metadata?.last_name,
      },
    });
  } catch (error) {
    console.error("Create user API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
