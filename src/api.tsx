import React from 'react';
import { View, ScrollView } from 'react-native';
import { throttle } from './utils';
import { FullOptions, normalizeOptions, PartialOptions } from './config';

export const scrollIntoView = async (
  scrollView: ScrollView,
  view: View,
  scrollX: number,
  scrollY: number,
  options: PartialOptions,
) => {
  const {
    alignX,
    alignY,
    animated,
    computeScrollX,
    computeScrollY,
    measureElement,
    insets,
  } = normalizeOptions(options);

  const [scrollViewLayout, viewLayout] = await Promise.all([
    measureElement(scrollView),
    measureElement(view),
  ]);

  const newScrollX = computeScrollX(
    scrollViewLayout,
    viewLayout,
    scrollX,
    insets,
    alignX,
  );

  const newScrollY = computeScrollY(
    scrollViewLayout,
    viewLayout,
    scrollY,
    insets,
    alignY,
  );

  const scrollResponder = scrollView.getScrollResponder();
  if (scrollResponder.scrollResponderScrollTo != null) {
    scrollResponder.scrollResponderScrollTo({
      x: newScrollX,
      y: newScrollY,
      animated,
    });
  } else {
    scrollView.scrollTo({ x: newScrollX, y: newScrollY, animated });
  }
};

type GetScrollView = () => ScrollView;
type GetScrollX = () => number;
type GetScrollY = () => number;
type GetDefaultOptions = () => FullOptions;

export type ScrollIntoViewDependencies = {
  getScrollView: GetScrollView;
  getScrollX: GetScrollX;
  getScrollY: GetScrollY;
  getDefaultOptions: GetDefaultOptions;
};

export class ScrollIntoViewAPI {
  dependencies: ScrollIntoViewDependencies;

  constructor(dependencies: ScrollIntoViewDependencies) {
    if (!dependencies.getScrollView) {
      throw new Error('getScrollView is required');
    }
    if (!dependencies.getScrollX) {
      throw new Error('getScrollX is required');
    }
    if (!dependencies.getScrollY) {
      throw new Error('getScrollY is required');
    }
    if (!dependencies.getDefaultOptions) {
      throw new Error('getDefaultOptions is required');
    }
    this.dependencies = dependencies;
  }

  getNormalizedOptions = (options: PartialOptions = {}) =>
    normalizeOptions(options, this.dependencies.getDefaultOptions());

  scrollIntoView = (view: View, options?: PartialOptions) => {
    const normalizedOptions = this.getNormalizedOptions(options);
    if (normalizedOptions.immediate) {
      return this.scrollIntoViewImmediate(view, normalizedOptions);
    } else {
      return this.scrollIntoViewThrottled(view, normalizedOptions);
    }
  };

  // We throttle the calls, so that if 2 views where to scroll into view at almost the same time, only the first one will do
  // ie if we want to scroll into view form errors, the first error will scroll into view
  // this behavior is probably subjective and should be configurable?
  scrollIntoViewThrottled = throttle((view: View, options: PartialOptions) => {
    return scrollIntoView(
      this.dependencies.getScrollView(),
      view,
      this.dependencies.getScrollX(),
      this.dependencies.getScrollY(),
      options,
    );
  }, 16);

  scrollIntoViewImmediate = (view: View, options: PartialOptions) => {
    return scrollIntoView(
      this.dependencies.getScrollView(),
      view,
      this.dependencies.getScrollX(),
      this.dependencies.getScrollY(),
      options,
    );
  };
}
