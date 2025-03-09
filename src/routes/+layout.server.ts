import TypeOrm from '$lib/db';
import { permissionsFromRole, User, UserRole } from '$lib/dbEntities/user';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { instanceToPlain } from 'class-transformer';
import type { BrontoSession } from '$lib/server/session';
 
export const load: LayoutServerLoad = async (event) => {
  const authSession = await event.locals.auth();
  let brontoSession: BrontoSession | null = null;

  // Authenticated user
  if (authSession) {
    // console.log("layout.server.ts: authSession: ", authSession);
    const userRepository = await TypeOrm.getRepository(User);
    let brontoUser: User | null = await userRepository.findOneBy({ email: authSession.user.email });

    if (! brontoUser) {
      console.log("layout.server.ts: creating new user");
      let newUser = new User();
      newUser.email = authSession.user.email;
      newUser.username = authSession.user.email;
      newUser.name = authSession.user.name;
      newUser.role = UserRole.EDITOR; // TODO: let admin select roles
      brontoUser = await userRepository.save(newUser);
    }

    // console.log("layout.server.ts: brontoUser: ", brontoUser);

    brontoSession = {
      user: instanceToPlain(brontoUser) as User,
      auth: authSession,
      permissions: permissionsFromRole[brontoUser.role],
    }

  // Unauthenticated user
  } else {
    console.log("layout.server.ts: no authSession");
    if (event.url.pathname.startsWith('/app') || event.url.pathname.startsWith('/api')) {
      console.log("invalid auth")
      redirect(303, '/');
    }
  }
  
  return {
    brontoSession: brontoSession,
  };
};