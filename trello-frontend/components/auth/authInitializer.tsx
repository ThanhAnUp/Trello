"use client"

import { useEffect } from "react"
import { useUserStore } from "@/store/user-store"

export function AuthInitializer() {
    const { fetchUser } = useUserStore()

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    return null
}
