"use client"
import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { FiX, FiCamera } from "react-icons/fi"
import styles from "./EditProfileModal.module.css"

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
        <div className={styles.modalOverlay}>
            <div className={styles.backdrop} onClick={onClose} />

            <div className={styles.modal}>
                <div className={styles.header}>
                    <button
                        onClick={onClose}
                        className={styles.iconButton}
                    >
                        <FiX className={styles.icon} />
                    </button>
                    <h2 className={styles.title}>Edit profile</h2>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={styles.saveButton}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>

                {error && (
                    <div className={styles.errorBanner}>
                        {error}
                    </div>
                )}

                <div className={styles.content}>
                    <div className={styles.bannerSection}>
                        {bannerPreview ? (
                            <Image
                                src={bannerPreview}
                                alt="Banner"
                                fill
                                sizes="600px"
                                className={styles.bannerImage}
                            />
                        ) : (
                            <div className={styles.bannerPlaceholder} />
                        )}
                        <div className={styles.bannerOverlay}>
                            <button
                                onClick={() => bannerInputRef.current?.click()}
                                className={styles.bannerControlButton}
                            >
                                <FiCamera className={styles.controlIcon} />
                            </button>
                            {bannerPreview && (
                                <button
                                    onClick={() => handleRemoveImage("banner")}
                                    className={styles.bannerControlButton}
                                >
                                    <FiX className={styles.controlIcon} />
                                </button>
                            )}
                        </div>
                        <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "banner")}
                            className={styles.hiddenInput}
                        />
                    </div>

                    <div className={styles.profileSection}>
                        <div className={styles.profileImageWrapper}>
                            {profilePicturePreview ? (
                                <Image
                                    src={profilePicturePreview}
                                    alt="Profile"
                                    fill
                                    sizes="128px"
                                    className={styles.profileImage}
                                />
                            ) : (
                                <div className={styles.profileInitial}>
                                    {formData.name[0]?.toUpperCase() || "?"}
                                </div>
                            )}
                            <div className={styles.profileOverlay}>
                                <button
                                    onClick={() => profilePictureInputRef.current?.click()}
                                    className={styles.bannerControlButton}
                                >
                                    <FiCamera className={styles.controlIcon} />
                                </button>
                            </div>
                        </div>
                        <input
                            ref={profilePictureInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "profile")}
                            className={styles.hiddenInput}
                        />
                    </div>

                    <div className={styles.form}>
                        <div className={styles.field}>
                            <label className={styles.label}>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                maxLength={50}
                                className={styles.input}
                                placeholder="Name"
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                maxLength={160}
                                rows={3}
                                className={styles.textarea}
                                placeholder="Bio"
                            />
                            <p className={styles.charCount}>
                                {formData.bio.length}/160
                            </p>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Website</label>
                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                maxLength={100}
                                className={styles.input}
                                placeholder="Website"
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Birth date</label>
                            <div className={styles.selectGroup}>
                                <select
                                    name="month"
                                    value={formData.month}
                                    onChange={handleSelectChange}
                                    className={styles.select}
                                >
                                    <option value="">Month</option>
                                    {months.map(month => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="day"
                                    value={formData.day}
                                    onChange={handleSelectChange}
                                    className={styles.select}
                                >
                                    <option value="">Day</option>
                                    {days.map(day => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleSelectChange}
                                    className={styles.select}
                                >
                                    <option value="">Year</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>
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

