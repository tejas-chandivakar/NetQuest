import type { ComponentType } from 'react'
import type { LessonSpec } from '../components/AnimatedLesson'
import type { ConfigureSpec } from '../components/ConfigureStage'
import type { BreakSpec } from '../components/BreakStage'
import SubnetCalculator from '../components/SubnetCalculator'
import BinaryBulbs from '../components/BinaryBulbs'
import AddressExplorer from '../components/AddressExplorer'
import EncapBuilder from '../components/EncapBuilder'
import PortMatch from '../components/PortMatch'
import { B4L1Journey, B4L2Journey, B4L3Journey } from './journeys'
import { b2l3Break, b4l3Break } from './foundationBreaks'
import { b1l1 } from './b1l1'
import { b2l3 } from './b2l3'
import { n2l1 } from './n2l1'
import { b1l2, b1l3, b1l4, b1l5 } from './beginner1'
import { b2l1, b2l2, b2l4, b2l5 } from './beginner2'
import { b3l1, b3l2, b3l3, b3l4, b3l5 } from './beginner3'
import { b4l1, b4l2, b4l3, b4l4, b4l5 } from './beginner4'
import { n1l0, n1l0Config } from './n1l0'
import { n1l3, n1l5 } from './ccnaFoundations'
import { n3l1, n3l2, n3l4, n3l4Config } from './ccnaRouting'
import { n1l6, n2l4 } from './ccnaAccess'
import { n1l1, n1l2, n1l7 } from './ccnaFundamentals'
import { n2l7 } from './ccnaDiscovery'
import { n4l3, n4l4 } from './ccnaServices'
import { n5l1, n5l3, n5l4, n5l5 } from './ccnaSecurity'
import { n6l1, n6l2, n6l3 } from './ccnaAutomation'
import { n1l4, n2l2 as n2l2Learn, n2l3 as n2l3Learn } from './ccna1'
import { n3l3 as n3l3Learn, n3l5 as n3l5Learn, n3l6 as n3l6Learn } from './ccna2'
import { n4l1 as n4l1Learn, n4l2 as n4l2Learn, n5l2 as n5l2Learn } from './ccna3'
import { n7l1 as n7l1Learn, n7l2 as n7l2Learn } from './ccna4'
import { n3l3Config } from './configs'
import { n3l3Break } from './breaks'
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
  n1l0,
  n1l1,
  n1l2,
  n1l3,
  n1l4,
  n1l5,
  n1l6,
  n1l7,
  n2l1,
  n2l2: n2l2Learn,
  n2l3: n2l3Learn,
  n2l4,
  n2l7,
  n3l1,
  n3l2,
  n3l3: n3l3Learn,
  n3l4,
  n3l5: n3l5Learn,
  n3l6: n3l6Learn,
  n4l1: n4l1Learn,
  n4l2: n4l2Learn,
  n4l3,
  n4l4,
  n5l1,
  n5l2: n5l2Learn,
  n5l3,
  n5l4,
  n5l5,
  n6l1,
  n6l2,
  n6l3,
  n7l1: n7l1Learn,
  n7l2: n7l2Learn,
}

/** Configure-stage labs that are built. */
export const CONFIGS: Record<string, ConfigureSpec> = {
  n1l0: n1l0Config,
  n2l2: n2l2Config,
  n2l3: n2l3Config,
  n3l3: n3l3Config,
  n3l4: n3l4Config,
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
  b2l3: b2l3Break,
  b4l3: b4l3Break,
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
  b2l1: AddressExplorer,
  b2l4: AddressExplorer,
  b2l5: BinaryBulbs,
  b3l2: EncapBuilder,
  b3l4: PortMatch,
  b4l1: B4L1Journey,
  b4l2: B4L2Journey,
  b4l3: B4L3Journey,
  n1l3: AddressExplorer,
  n1l4: SubnetCalculator,
  n1l5: SubnetCalculator,
}

export const hasLesson = (id: string) =>
  id in LESSONS || id in CONFIGS || id in BREAKS || id in TOOLS
export const getLesson = (id: string): LessonSpec | undefined => LESSONS[id]
export const getConfig = (id: string): ConfigureSpec | undefined => CONFIGS[id]
export const getBreak = (id: string): BreakSpec | undefined => BREAKS[id]
export const getTool = (id: string): ComponentType | undefined => TOOLS[id]
