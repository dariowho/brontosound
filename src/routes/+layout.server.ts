import { readSettings } from '$lib/server/bandSettings';
import type { LayoutServerLoad } from './$types';
 
export const load: LayoutServerLoad = async (event) => {
  const bandSettings = await readSettings();
  
  return {
    bandName: bandSettings.bandName ?? "Brontosound",
    bandLogo: bandSettings.bandLogo ?? "/bronto.png",
    brontoSession: event.locals['brontoSession']
  }
};