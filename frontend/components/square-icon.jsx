const SquareIcon = ({ squareColor, title }) => {
  return (
    <i
      className="bi bi-square-fill"
      style={{ color: squareColor }}
      title={title}
    ></i>
  )
}

export default SquareIcon
