import { Icon } from 'tea-component'
import React from 'react'

interface Props {
  id: string
  children: React.ReactNode
  title: React.ReactNode
  activeIds: string[]
  onChange: Function
}
export default function(props: Props) {
  const { title, id, activeIds, children, onChange } = props
  const active = activeIds.includes(id)
  const [firstRender, setFirstRender] = React.useState(false)
  React.useEffect(() => {
    if (active) setFirstRender(true)
  }, [active])
  return (
    <>
      <section
        style={{ cursor: 'pointer', padding: '10px 0', backgroundColor: '#e2e5ea', marginTop: '10px' }}
        onClick={() => {
          const newActiveIds = [...activeIds]
          if (active) {
            const index = newActiveIds.findIndex(item => item === id)
            if (index !== -1) {
              newActiveIds.splice(index, 1)
            }
          } else {
            newActiveIds.push(id)
          }
          onChange(newActiveIds)
        }}
      >
        <Icon type={active ? 'arrowdown' : 'arrowright'}></Icon>
        {title}
      </section>
      {firstRender && <section style={{ marginTop: '20px', display: active ? 'block' : 'none' }}>{children}</section>}
    </>
  )
}
