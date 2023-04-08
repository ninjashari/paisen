const SquareIcon = (props) => {
  return (
    <i
      className="bi bi-square-fill"
      style={{ color: props.squareColor }}
      title={props.title}
    ></i>
  )
}

export default SquareIcon
