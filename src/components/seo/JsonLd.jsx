export default function JsonLd({ data }) {
  if (!data) return null

  try {
    const json = Array.isArray(data) ? data : [data]

    return (
      <>
        {json.map((item, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(item),
            }}
          />
        ))}
      </>
    )
  } catch (error) {
    console.error('JSON-LD Error:', error)
    return null
  }
}