/**
 * Sesión en la app: quién inició sesión, con qué plan y en qué servicio.
 * Las pantallas la leen con `useAccount()`; las acciones pasan por aquí para
 * que las preferencias y la biblioteca sigan a la cuenta.
 */
import { useEffect, useState } from 'preact/hooks';
import type { PlanId } from '../config/plans';
import { setSettingsScope } from '../lib/settings';
import { backend } from './backend';
import type { SignUpInput, User } from './types';

export interface AccountState {
  ready: boolean;
  user: User | null;
  backendKind: 'local' | 'remote' | null;
  backendLabel: string;
}

let state: AccountState = { ready: false, user: null, backendKind: null, backendLabel: '' };
const listeners = new Set<(s: AccountState) => void>();

function set(patch: Partial<AccountState>) {
  state = { ...state, ...patch };
  // Las preferencias de lectura siguen a la cuenta (en este dispositivo).
  setSettingsScope(state.user?.id ?? null);
  listeners.forEach((l) => l(state));
}

export const getAccount = (): AccountState => state;

let started: Promise<void> | null = null;

/** Lee la sesión guardada; se llama una vez al abrir la app. */
export function initAccount(): Promise<void> {
  started ??= (async () => {
    const b = await backend();
    let user: User | null = null;
    try {
      user = await b.currentUser();
    } catch {
      user = null;
    }
    set({ ready: true, user, backendKind: b.kind, backendLabel: b.label });
  })();
  return started;
}

export async function signIn(email: string, password: string): Promise<User> {
  const user = await (await backend()).signIn(email, password);
  set({ user });
  return user;
}

export async function signUp(input: SignUpInput): Promise<User> {
  const user = await (await backend()).signUp(input);
  set({ user });
  return user;
}

export async function signOut(): Promise<void> {
  await (await backend()).signOut();
  set({ user: null });
}

/** Solo desarrollo: cambia el plan de la cuenta de prueba local. */
export async function devSetPlan(plan: PlanId): Promise<void> {
  const b = await backend();
  if (!b.dev) throw new Error('Este servicio no permite cambiar el plan desde la app.');
  set({ user: await b.dev.setPlan(plan) });
}

export function useAccount(): AccountState {
  const [s, setS] = useState(state);
  useEffect(() => {
    listeners.add(setS);
    setS(state);
    void initAccount();
    return () => {
      listeners.delete(setS);
    };
  }, []);
  return s;
}
