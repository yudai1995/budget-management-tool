import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { CategoryDonutChart } from '../../components/report/CategoryDonutChart'

const slices = [
  { name: '食費・スーパー', color: '#0075FF', amount: 30000 },
  { name: '外食・カフェ', color: '#FF3E3E', amount: 15000 },
  { name: '日用品', color: '#F250F8', amount: 5000 },
]

describe('CategoryDonutChart', () => {
  it('スライスが空のとき何も描画しない', () => {
    const { container } = render(<CategoryDonutChart slices={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('合計金額が0のとき何も描画しない', () => {
    const { container } = render(
      <CategoryDonutChart slices={[{ name: 'test', color: '#000', amount: 0 }]} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('SVG が aria-label="カテゴリ別支出円グラフ" で描画される', () => {
    render(<CategoryDonutChart slices={slices} />)
    expect(screen.getByRole('img', { name: 'カテゴリ別支出円グラフ' })).toBeInTheDocument()
  })

  it('支出合計ラベルが表示される', () => {
    render(<CategoryDonutChart slices={slices} />)
    expect(screen.getByText('支出合計')).toBeInTheDocument()
  })

  it('合計金額が正しくフォーマットされて表示される', () => {
    render(<CategoryDonutChart slices={slices} />)
    expect(screen.getByText('¥50,000')).toBeInTheDocument()
  })

  it('各カテゴリ名が凡例に表示される', () => {
    render(<CategoryDonutChart slices={slices} />)
    expect(screen.getByText('食費・スーパー')).toBeInTheDocument()
    expect(screen.getByText('外食・カフェ')).toBeInTheDocument()
    expect(screen.getByText('日用品')).toBeInTheDocument()
  })

  it('各カテゴリの金額が凡例に表示される', () => {
    render(<CategoryDonutChart slices={slices} />)
    expect(screen.getByText('¥30,000')).toBeInTheDocument()
    expect(screen.getByText('¥15,000')).toBeInTheDocument()
    expect(screen.getByText('¥5,000')).toBeInTheDocument()
  })

  it('パーセンテージが計算されて表示される', () => {
    render(<CategoryDonutChart slices={slices} />)
    // 30000/50000=60%, 15000/50000=30%, 5000/50000=10%
    expect(screen.getByText('(60%)')).toBeInTheDocument()
    expect(screen.getByText('(30%)')).toBeInTheDocument()
    expect(screen.getByText('(10%)')).toBeInTheDocument()
  })

  it('カテゴリ数だけ path 要素が描画される', () => {
    const { container } = render(<CategoryDonutChart slices={slices} />)
    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(slices.length)
  })

  it('単一カテゴリ（100%）でも描画できる', () => {
    render(
      <CategoryDonutChart slices={[{ name: '食費・スーパー', color: '#0075FF', amount: 20000 }]} />
    )
    expect(screen.getByText('食費・スーパー')).toBeInTheDocument()
    expect(screen.getAllByText('¥20,000').length).toBeGreaterThanOrEqual(1)
  })

  it('カラードットに正しい背景色が設定される', () => {
    const { container } = render(<CategoryDonutChart slices={slices} />)
    const dots = container.querySelectorAll('li span[style]')
    const colors = Array.from(dots).map((el) => (el as HTMLElement).style.backgroundColor)
    expect(colors).toContain('rgb(0, 117, 255)')
  })
})
