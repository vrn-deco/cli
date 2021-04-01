export type Resource = Lang[]

export interface Lang {
  label: string // 名称
  desc?: string // 描述
  key: string // 资源目录名称
  frameworks: Framework[]
}

export interface Framework {
  label: string // 名称
  desc?: string // 描述
  key: string // 资源目录名称
  boilerplate: Boilerplate[]
}

export interface Boilerplate {
  label: string // 名称
  desc?: string // 描述
  key: string // 资源目录名称
  version: string // 版本号 'a.b.c'
  flag?: string // 特殊标记，例如： typescript、docker
  tags: string[] // 标签
}
