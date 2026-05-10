import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const meta: Meta = {
  title: 'Common/Tabs',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

export const Basic: Story = {
  render: () => (
    <div className="w-80">
      <Tabs defaultValue="expense">
        <TabsList>
          <TabsTrigger value="expense">支出</TabsTrigger>
          <TabsTrigger value="income">収入</TabsTrigger>
        </TabsList>
        <TabsContent value="expense">
          <p className="text-sm text-[#1c1410]/70 p-2">支出の内容がここに表示されます</p>
        </TabsContent>
        <TabsContent value="income">
          <p className="text-sm text-[#1c1410]/70 p-2">収入の内容がここに表示されます</p>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

export const ThreeTabs: Story = {
  render: () => (
    <div className="w-96">
      <Tabs defaultValue="week">
        <TabsList>
          <TabsTrigger value="week">直近7日</TabsTrigger>
          <TabsTrigger value="month">今月</TabsTrigger>
          <TabsTrigger value="prev">先月</TabsTrigger>
        </TabsList>
        <TabsContent value="week">
          <p className="text-sm text-[#1c1410]/70 p-2">直近7日間のデータ</p>
        </TabsContent>
        <TabsContent value="month">
          <p className="text-sm text-[#1c1410]/70 p-2">今月のデータ</p>
        </TabsContent>
        <TabsContent value="prev">
          <p className="text-sm text-[#1c1410]/70 p-2">先月のデータ</p>
        </TabsContent>
      </Tabs>
    </div>
  ),
}
