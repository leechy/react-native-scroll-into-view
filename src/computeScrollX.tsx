import React from 'react';
import { LayoutRectangle } from 'react-native';
import { Insets, AlignHorizontal } from './config';

type ComputationData = {
  scrollViewWidth: number;
  scrollX: number;
  viewStartX: number;
  viewEndX: number;
  insets: Insets;
};

export const computeScrollX = (
  scrollViewLayout: LayoutRectangle,
  viewLayout: LayoutRectangle,
  scrollX: number,
  insets: Insets,
  alignX: AlignHorizontal,
) => {
  const scrollViewWidth = scrollViewLayout.width;
  const childWidth = viewLayout.width;
  // layout measures are relative to window, so we make them relative to ScrollView instead
  const viewStartX = viewLayout.x - scrollViewLayout.x;
  const viewEndX = viewStartX + childWidth;
  const computationData = {
    scrollViewWidth,
    scrollX,
    viewStartX,
    viewEndX,
    insets,
  };
  switch (alignX) {
    case 'auto':
      return computeScrollXAuto(computationData);
    case 'start':
      return computeScrollXStart(computationData);
    case 'end':
      return computeScrollXEnd(computationData);
    case 'center':
      return computeScrollXCenter(computationData);
    default:
      throw new Error(`align=${alignX} not supported`);
  }
};

export const computeScrollXAuto = (data: ComputationData): number => {
  const { scrollX } = data;
  const scrollXStart = computeScrollXStart(data);
  if (scrollX > scrollXStart) {
    return scrollXStart;
  }
  const scrollXEnd = computeScrollXEnd(data);
  if (scrollX < scrollXEnd) {
    return scrollXEnd;
  }
  return scrollX;
};

export const computeScrollXStart = ({
  scrollViewWidth,
  scrollX,
  viewStartX,
  insets,
}: ComputationData): number => {
  return scrollX + viewStartX - insets.start;
};

export const computeScrollXEnd = ({
  scrollViewWidth,
  scrollX,
  viewStartX,
  viewEndX,
  insets,
}: ComputationData): number => {
  return scrollX + viewEndX - scrollViewWidth + insets.end;
};

export const computeScrollXCenter = (data: ComputationData): number => {
  return (computeScrollXStart(data) + computeScrollXEnd(data)) / 2;
};
