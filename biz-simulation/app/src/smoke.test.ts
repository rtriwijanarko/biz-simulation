describe('smoke', () => {
  it('menjalankan tes dengan jsdom dan matcher jest-dom', () => {
    expect(1 + 1).toBe(2)
    expect(typeof document).toBe('object')
    const el = document.createElement('div')
    document.body.appendChild(el)
    expect(el).toBeInTheDocument()
  })
})
