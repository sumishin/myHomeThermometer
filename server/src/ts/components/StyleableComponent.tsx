import * as React from 'react';
import { InjectedCSSModuleProps } from 'react-css-modules';

//tslint:disable-next-line:no-any
export type Styles = any;

//tslint:disable-next-line:no-empty-interface
export interface StyleableComponentProps extends InjectedCSSModuleProps {
}

export abstract class StyleableComponent<P extends StyleableComponentProps, S> extends React.Component<P, S> {

  constructor(props: P, context?: {}) {
    super(props, context);
  }

  protected get styles(): Styles {
    if (!(this.props.styles)) {
      throw new Error('Styles undefined!');
    }
    return this.props.styles;
  }
}
