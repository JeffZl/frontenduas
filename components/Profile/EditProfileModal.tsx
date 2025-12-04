"use client"
import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { FiX, FiCamera } from "react-icons/fi"

interface EditProfileModalProps {
    isOpen: boolean
    onClose: () => void
    user: any | null
    onSave: (updatedData: Record<string, unknown>) => Promise<void>
}

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const days = Array.from({ length: 31 }, (_, i) => i + 1)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        location: "",
        website: "",
        month: "",
        day: "",
        year: ""
    })
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    const profilePictureInputRef = useRef<HTMLInputElement>(null)
    const bannerInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen && user) {
            // Initialize form data from user
            setFormData({
                name: user.name || "",
                bio: user.bio || "",
                location: user.location || "",
                website: user.website || "",
                month: "",
                day: "",
                year: ""
            })

            // Parse birthdate if it exists
            if (user.birthdate) {
                const birthDate = new Date(user.birthdate)
                setFormData(prev => ({
                    ...prev,
                    month: months[birthDate.getMonth()] || "",
                    day: birthDate.getDate().toString() || "",
                    year: birthDate.getFullYear().toString() || ""
                }))
            }

            // Set previews from existing images
            setProfilePicturePreview(user.profilePicture?.url || null)
            setBannerPreview(user.coverPicture?.url || null)
            setProfilePictureFile(null)
            setBannerFile(null)
        }
    }, [isOpen, user])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "banner") => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            if (type === "profile") {
                setProfilePicturePreview(reader.result as string)
                setProfilePictureFile(file)
            } else {
                setBannerPreview(reader.result as string)
                setBannerFile(file)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveImage = (type: "profile" | "banner") => {
        if (type === "profile") {
            setProfilePicturePreview(null)
            setProfilePictureFile(null)
            if (profilePictureInputRef.current) {
                profilePictureInputRef.current.value = ""
            }
        } else {
            setBannerPreview(null)
            setBannerFile(null)
            if (bannerInputRef.current) {
                bannerInputRef.current.value = ""
            }
        }
    }

    const toBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
        })
    }

    const handleSave = async () => {
        setLoading(true)
        setError("")

        try {
            // Prepare update data
            const updateData: any = {
                name: formData.name.trim(),
                bio: formData.bio.trim(),
                location: formData.location.trim(),
                website: formData.website.trim()
            }

            // Handle birthdate
            if (formData.month && formData.day && formData.year) {
                const monthIndex = months.indexOf(formData.month)
                if (monthIndex !== -1) {
                    updateData.birthdate = new Date(
                        parseInt(formData.year),
                        monthIndex,
                        parseInt(formData.day)
                    ).toISOString()
                }
            }

            // Handle profile picture upload
            if (profilePictureFile) {
                const base64 = await toBase64(profilePictureFile)
                updateData.profilePicture = { base64, type: "image" }
            }

            // Handle banner upload
            if (bannerFile) {
                const base64 = await toBase64(bannerFile)
                updateData.coverPicture = { base64, type: "image" }
            }

            await onSave(updateData)
            onClose()
        } catch (err: any) {
            setError(err.message || "Failed to save profile")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl overflow-hidden flex flex-col z-10 mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                    >
                        <FiX className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit profile</h2>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white font-semibold rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="px-4 py-2 bg-red-500/10 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1">
                    {/* Banner section */}
                    <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-800">
                        {bannerPreview ? (
                            <Image
                                src={bannerPreview}
                                alt="Banner"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 hover:opacity-100 transition">
                            <button
                                onClick={() => bannerInputRef.current?.click()}
                                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                            >
                                <FiCamera className="w-5 h-5 text-white" />
                            </button>
                            {bannerPreview && (
                                <button
                                    onClick={() => handleRemoveImage("banner")}
                                    className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                                >
                                    <FiX className="w-5 h-5 text-white" />
                                </button>
                            )}
                        </div>
                        <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "banner")}
                            className="hidden"
                        />
                    </div>

                    {/* Profile picture section */}
                    <div className="relative px-4 -mt-16 mb-4">
                        <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-[#1a1a1a] overflow-hidden bg-gray-200 dark:bg-gray-800">
                            {profilePicturePreview ? (
                                <Image
                                    src={profilePicturePreview}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-4xl font-bold text-gray-400">
                                        {formData.name[0]?.toUpperCase() || "?"}
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition cursor-pointer">
                                <button
                                    onClick={() => profilePictureInputRef.current?.click()}
                                    className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                                >
                                    <FiCamera className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                        <input
                            ref={profilePictureInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "profile")}
                            className="hidden"
                        />
                    </div>

                    {/* Form fields */}
                    <div className="px-4 pb-4 space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                maxLength={50}
                                className="w-full px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Name"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Bio
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                maxLength={160}
                                rows={3}
                                className="w-full px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Bio"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                                {formData.bio.length}/160
                            </p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                maxLength={30}
                                className="w-full px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Location"
                            />
                        </div>

                        {/* Website */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Website
                            </label>
                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                maxLength={100}
                                className="w-full px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Website"
                            />
                        </div>

                        {/* Birth date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Birth date
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <select
                                    name="month"
                                    value={formData.month}
                                    onChange={handleSelectChange}
                                    className="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Month</option>
                                    {months.map(month => (
                                        <option key={month} value={month} className="bg-white dark:bg-[#1a1a1a]">
                                            {month}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="day"
                                    value={formData.day}
                                    onChange={handleSelectChange}
                                    className="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Day</option>
                                    {days.map(day => (
                                        <option key={day} value={day} className="bg-white dark:bg-[#1a1a1a]">
                                            {day}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleSelectChange}
                                    className="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Year</option>
                                    {years.map(year => (
                                        <option key={year} value={year} className="bg-white dark:bg-[#1a1a1a]">
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

