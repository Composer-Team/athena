import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'End-to-end',
    Svg: require('@site/static/img/end-to-end.svg').default,
    description: (
      <>
        An end-to-end framework for compiling and executing Boolean TFHE programs.
      </>
    ),
  },
  {
    title: 'Designed for Serving',
    Svg: require('@site/static/img/serving.svg').default,
    description: (
      <>
        Aims at privacy-preserving computation offload on the server side.
      </>
    ),
  },
  {
    title: 'High Performant',
    Svg: require('@site/static/img/rocket.svg').default,
    description: (
      <>
        Achieves up to two orders of magnitude performance advantage
        over existing frameworks.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
