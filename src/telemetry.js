'use strict'

const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus')
const { MeterProvider } = require('@opentelemetry/sdk-metrics-base')

const exporter = new PrometheusExporter({ preventServerStart: true })
const meters = {}
const metrics = {}

// Create all the metrics
meters.s3Meter = new MeterProvider({ exporter, interval: 100 }).getMeter('s3')
metrics.s3Heads = meters.s3Meter.createCounter('s3-fetchs', { description: 'Heads on S3' })
metrics.s3HeadsDurations = meters.s3Meter.createCounter('s3-heads-durations', {
  description: 'Heads durations on S3'
})
metrics.s3Signs = meters.s3Meter.createCounter('s3-fetchs', { description: 'Signs on S3' })
metrics.s3SignsDurations = meters.s3Meter.createCounter('s3-signs-durations', {
  description: 'Signs durations on S3'
})

function trackDuration(metric, startTime) {
  metric.add(Number(process.hrtime.bigint() - startTime) / 1e6)
}

function storeMetrics() {
  /* c8 ignore next 3 */
  if (!exporter._batcher.hasMetric) {
    return '# no registered metrics'
  } else {
    return exporter._serializer.serialize(exporter._batcher.checkPointSet())
  }
}

module.exports = {
  meters,
  metrics,
  storeMetrics,
  trackDuration
}
