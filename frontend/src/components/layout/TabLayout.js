import React, { useState } from "react"
import { Tab, Tabs } from "react-bootstrap"

function TabLayout() {
  const tabs = [
    { key: "current", name: "Currently Watching" },
    { key: "completed", name: "Completed" },
    { key: "onhold", name: "On Hold" },
    { key: "dropped", name: "Dropped" },
    { key: "plan", name: "Plan to Watch" },
  ]

  const [selectedTab, setSelectedTab] = useState("current")

  const handleSelect = async (tabKey) => {
    setSelectedTab(tabKey)
    console.log(selectedTab)
  }
  return (
    <Tabs defaultActiveKey="current" onSelect={handleSelect} fill>
      {tabs.map((tab) => (
        <Tab eventKey={tab.key} title={tab.name}></Tab>
      ))}
    </Tabs>
  )
}

export default TabLayout
