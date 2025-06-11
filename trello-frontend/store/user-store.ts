import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Session } from "next-auth"
import axios from "axios"
import { redirect } from "next/navigation"

export interface UserProfile {
    email: string,
    name: string,
    id: string,
    createdAt: {
        _nanoseconds: number,
        _seconds: number
    }
}

interface UserState {
    user: (Session["user"] & Partial<UserProfile>) | null
    isLoading: boolean
    setUser: (user: (Session["user"] & Partial<UserProfile>) | null) => void
    fetchUser: () => Promise<void>
    logout: () => Promise<void>
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: true,
            setUser: (user) => set({ user, isLoading: false }),
            fetchUser: async () => {

                try {
                    set({ isLoading: true })
                    const res = await axios.get(`/auth/me`, {
                        baseURL: process.env.NEXT_PUBLIC_API_URL,
                        withCredentials: true,
                    })
                    const user = res.data?.user || res.data
                    if (user) {
                        set({ user, isLoading: false })
                    } else {
                        localStorage.removeItem("user-storage")
                        set({ user: null, isLoading: false })
                        redirect("/auth/signin")
                    }
                } catch (err: any) {
                    if (err.response?.status === 401) {
                        localStorage.removeItem("user-storage")
                    }
                    set({ user: null, isLoading: false })
                    redirect("/auth/signin")
                } finally {
                    set({ isLoading: false })
                }
            },


            logout: async () => {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`)
                set({ user: null })
                redirect("/auth/signin")
            },
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user }),
        }
    )
)
