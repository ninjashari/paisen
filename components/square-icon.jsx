const SquareIcon = ({ squareColor, title }) => {
  return (
    <span
      title={title}
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: squareColor }}
    />
  )
}

export default SquareIcon
