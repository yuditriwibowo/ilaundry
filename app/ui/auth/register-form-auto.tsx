// Auto sign-in setelah registrasi sukses (credentials + tokoId baru),
// set cookie selected_toko, lalu redirect ke beranda.

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import type { State } from "@/app/lib/actions";
import { setSelectedTokoAction } from "@/app/lib/actions";

export function AutoSignInOnSuccess({
  state,
  email,
  password,
  setMessage,
  router,
  startAutoSignIn,
}: {
  state: State;
  email: string;
  password: string;
  setMessage: (v: string) => void;
  router: ReturnType<typeof import("next/navigation").useRouter>;
  startAutoSignIn: (fn: () => Promise<void>) => void;
}) {
  // Guard agar auto sign-in hanya dipicu sekali setelah registrasi sukses.
  const startedRef = useRef(false);
  useEffect(() => {
    if (
      state.success &&
      state.tokoId &&
      email &&
      password &&
      !startedRef.current
    ) {
      startedRef.current = true;
      startAutoSignIn(async () => {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
          tokoId: state.tokoId!,
        });
        if (res?.error) {
          setMessage(
            "Akun berhasil dibuat, namun gagal masuk otomatis. Silakan login manual.",
          );
          return;
        }
        await setSelectedTokoAction(state.tokoId!);
        router.push("/laundry");
        router.refresh();
      });
    }
  }, [state, email, password, router, startAutoSignIn, setMessage]);

  return null;
}
