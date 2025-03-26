import React from 'react';
import { LayoutRectangle } from 'react-native';
import { Insets, AlignVertical } from './config';

type ComputationData = {
  scrollViewHeight: number;
  scrollY: number;
  viewTopY: number;
  viewBottomY: number;
  insets: Insets;
};

export const computeScrollY = (
  scrollViewLayout: LayoutRectangle,
  viewLayout: LayoutRectangle,
  scrollY: number,
  insets: Insets,
  alignY: AlignVertical,
) => {
  const scrollViewHeight = scrollViewLayout.height;
  const childHeight = viewLayout.height;
  // layout measures are relative to window, so we make them relative to ScrollView instead
  const viewTopY = viewLayout.y - scrollViewLayout.y;
  const viewBottomY = viewTopY + childHeight;
  const computationData = {
    scrollViewHeight,
    scrollY,
    viewTopY,
    viewBottomY,
    insets,
  };
  switch (alignY) {
    case 'auto':
      return computeScrollYAuto(computationData);
    case 'top':
      return computeScrollYTop(computationData);
    case 'bottom':
      return computeScrollYBottom(computationData);
    case 'center':
      return computeScrollYCenter(computationData);
    default:
      throw new Error(`align=${alignY} not supported`);
  }
};

export const computeScrollYAuto = (data: ComputationData): number => {
  const { scrollY } = data;
  const scrollYTop = computeScrollYTop(data);
  if (scrollY > scrollYTop) {
    return scrollYTop;
  }
  const scrollYBottom = computeScrollYBottom(data);
  if (scrollY < scrollYBottom) {
    return scrollYBottom;
  }
  return scrollY;
};

export const computeScrollYTop = ({
  scrollViewHeight,
  scrollY,
  viewTopY,
  insets,
}: ComputationData): number => {
  return scrollY + viewTopY - insets.top;
};

export const computeScrollYBottom = ({
  scrollViewHeight,
  scrollY,
  viewTopY,
  viewBottomY,
  insets,
}: ComputationData): number => {
  return scrollY + viewBottomY - scrollViewHeight + insets.bottom;
};

export const computeScrollYCenter = (data: ComputationData): number => {
  return (computeScrollYTop(data) + computeScrollYBottom(data)) / 2;
};
