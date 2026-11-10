import type { ComponentType } from 'react'
import type { LessonSpec } from '../components/AnimatedLesson'
import type { ConfigureSpec } from '../components/ConfigureStage'
import type { BreakSpec } from '../components/BreakStage'
import SubnetCalculator from '../components/SubnetCalculator'
import { b1l1 } from './b1l1'
import { b2l3 } from './b2l3'
import { n2l1 } from './n2l1'
import { b1l2, b1l3, b1l4, b1l5 } from './beginner1'
import { b2l1, b2l2, b2l4, b2l5 } from './beginner2'
import { b3l1, b3l2, b3l3, b3l4, b3l5 } from './beginner3'
import { b4l1, b4l2, b4l3, b4l4, b4l5 } from './beginner4'
import { b1l1Config, n3l3Config } from './configs'
import { b1l1Break, n3l3Break } from './breaks'
import { n2l2Break, n2l2Config, n2l3Config } from './switching'
import {
  n3l5Break,
  n3l5Config,
  n3l6Break,
  n3l6Config,
  n4l1Config,
  n4l2Break,
  n4l2Config,
  n5l2Break,
  n5l2Config,
  p2l4Config,
} from './protocols'
import { n7l1Config, n7l2Config } from './projects'

/** Learn-stage animations that are built. */
export const LESSONS: Record<string, LessonSpec> = {
  b1l1,
  b1l2,
  b1l3,
  b1l4,
  b1l5,
  b2l1,
  b2l2,
  b2l3,
  b2l4,
  b2l5,
  b3l1,
  b3l2,
  b3l3,
  b3l4,
  b3l5,
  b4l1,
  b4l2,
  b4l3,
  b4l4,
  b4l5,
  n2l1,
}

/** Configure-stage labs that are built. */
export const CONFIGS: Record<string, ConfigureSpec> = {
  b1l1: b1l1Config,
  n2l2: n2l2Config,
  n2l3: n2l3Config,
  n3l3: n3l3Config,
  n3l5: n3l5Config,
  n3l6: n3l6Config,
  n4l1: n4l1Config,
  n4l2: n4l2Config,
  n5l2: n5l2Config,
  n7l1: n7l1Config,
  n7l2: n7l2Config,
  p2l4: p2l4Config,
}

/** Break-it sandboxes that are built. */
export const BREAKS: Record<string, BreakSpec> = {
  b1l1: b1l1Break,
  n2l2: n2l2Break,
  n3l3: n3l3Break,
  n3l5: n3l5Break,
  n3l6: n3l6Break,
  n4l2: n4l2Break,
  n5l2: n5l2Break,
}

/**
 * Interactive tools that stand in for the Configure stage when a lesson is
 * about working something out rather than typing commands.
 */
export const TOOLS: Record<string, ComponentType> = {
  n1l4: SubnetCalculator,
}

export const hasLesson = (id: string) =>
  id in LESSONS || id in CONFIGS || id in BREAKS || id in TOOLS
export const getLesson = (id: string): LessonSpec | undefined => LESSONS[id]
export const getConfig = (id: string): ConfigureSpec | undefined => CONFIGS[id]
export const getBreak = (id: string): BreakSpec | undefined => BREAKS[id]
export const getTool = (id: string): ComponentType | undefined => TOOLS[id]
