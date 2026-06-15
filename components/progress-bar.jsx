const Progressbar = ({ fillPercentage }) => {
  return (
    <div className="bg-primary/15 h-2 w-full overflow-hidden rounded-full">
      <div
        className="bg-primary h-full rounded-full transition-all"
        role="progressbar"
        style={{ width: fillPercentage }}
      />
    </div>
  )
}

export default Progressbar
