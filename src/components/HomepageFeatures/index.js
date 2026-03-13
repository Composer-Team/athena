import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'End-to-End',
    img: 'img/e2e.png',
    imgStyle: { maxHeight: '250px', maxWidth: '250px' },
    description: (
      <>
        Evaluate the complete RAG pipeline—from embedding generation through vector retrieval to LLM response—in a single unified framework.
      </>
    ),
  },
  {
    title: 'Flexible',
    img: 'img/pnp.png',
    description: (
      <>
        Modular plug-and-play architecture lets you swap embedding models, vector databases, and LLM backends. Because no single configuration fits every RAG workload.
      </>
    ),
  },
  {
    title: 'Advisory',
    img: 'img/advisory.png',
    description: (
      <>
        Easily extract the metrics that matter—latency, throughput, accuracy, and resource utilization—to guide optimization decisions for your specific deployment constraints.
      </>
    ),
  },
];

function Feature({img, imgStyle, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={img} className={styles.featureSvg} style={imgStyle} alt={title} />
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
