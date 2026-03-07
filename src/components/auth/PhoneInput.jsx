import { useState } from 'react'

export default function PhoneInput({ value, onChange, className = '' }) {
    const [phone, setPhone] = useState(value || '')

    const handleChange = (e) => {
        const input = e.target.value.replace(/\D/g, '')
        if (input.length <= 10) {
            setPhone(input)
            onChange(input)
        }
    }

    return (
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                +91
            </div>
            <input
                type="tel"
                value={phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className={`w-full bg-bg-secondary border border-border-subtle rounded-xl pl-16 pr-4 py-4 text-white placeholder:text-text-muted focus:outline-none focus:border-accent transition ${className}`}
                maxLength={10}
            />
        </div>
    )
}
