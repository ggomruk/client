import React from 'react'
import ProtectedLayout from './ProtectedLayout'

export default function AppLayout({children}: {children: React.ReactNode}) {
    return (
        <ProtectedLayout>
            {children}
        </ProtectedLayout>
    )
}
