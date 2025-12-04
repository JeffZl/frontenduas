"use client"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FaImage } from "react-icons/fa"
import styles from "./style.module.css"

const Page = () => {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [fileData, setFileData] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
      setFileData(file)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!content.trim() && !fileData) {
      setErrorMsg("Please type something or upload an image.")
      return
    }

    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      let media: any = []
      if (fileData) {
        const base64 = await toBase64(fileData)
        const type = fileData.type.startsWith("video") ? "video" : "image"
        media = [{ base64, type }]
      }

      const res = await fetch("/api/tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          media,
          hashtags: content.match(/#[\w]+/g) || [],
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to post quote")

      setSuccessMsg("Quote posted successfully!")
      setContent("")
      setPreview(null)
      setFileData(null)

      setTimeout(() => router.push("/"), 1500)
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })
  }

  return (
    <main className={`${styles.container}`}>
      <h1 className={`${styles.title}`}>Create Quote</h1>

      <div className={`${styles.formContainer}`}>
        <textarea
          id="quote-text"
          placeholder="Write your quote..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`${styles.textarea}`}
        />

        <div className={styles.uploadContainer}>
          <label
            htmlFor="image-upload"
            className={`${styles.uploadButton}`}
          >
            <FaImage className={styles.uploadIcon} />
            Upload Image
          </label>
          <input
            type="file"
            id="image-upload"
            accept="image/*,video/*"
            className={styles.fileInput}
            onChange={handleImageUpload}
          />
        </div>

        {preview && (
          <div id="image-preview">
            <Image
              src={preview}
              alt="Preview"
              width={600}
              height={400}
              className={styles.previewImage}
            />
          </div>
        )}

        {errorMsg && (
          <p className={styles.errorMessage}>{errorMsg}</p>
        )}
        {successMsg && (
          <p className={styles.successMessage}>{successMsg}</p>
        )}

        <button
          id="post-btn"
          onClick={handleSubmit}
          disabled={loading}
          className={`${styles.submitButton} ${
            loading ? styles.submitButtonDisabled : ""
          }`}
        >
          {loading ? "Posting..." : "Post Quote"}
        </button>
      </div>
    </main>
  )
}

export default Page