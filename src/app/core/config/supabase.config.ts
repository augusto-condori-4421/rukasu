import { environment } from '../../../environments/environment';

export const supabaseConfig = {
  url: environment.supabaseUrl,
  anonKey: environment.supabaseKey,
};
