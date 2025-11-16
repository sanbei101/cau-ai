# 农大 AI 平台

```更新组件库
# 先删除空文件夹
find src/components/ui -type d -empty -delete
# 然后更新组件库
for dir in src/components/ui/*/
    set component (basename "$dir")
    echo "Adding component: $component"
    pnpm dlx shadcn-vue@latest add -y "$component" --overwrite
end
```
