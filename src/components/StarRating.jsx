export default function StarRating({ stars = 5 }) {
  return (
    <span className="stars" aria-label={`${stars} star hotel`}>
      {'★'.repeat(stars)}
      {'☆'.repeat(Math.max(0, 5 - stars))}
    </span>
  )
}
