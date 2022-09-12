"""Containers module."""

from dependency_injector import containers, providers
from flask_socketio import SocketIO
from ldm.generate import Generate
from server import services

class Container(containers.DeclarativeContainer):
  wiring_config = containers.WiringConfiguration(packages=['server'])

  config = providers.Configuration()

  socketio = providers.ThreadSafeSingleton(
    SocketIO,
    app = None
  )

  model_singleton = providers.ThreadSafeSingleton(
    Generate,
    width = config.model.width,
    height = config.model.height,
    sampler_name = config.model.sampler_name,
    weights = config.model.weights,
    full_precision = config.model.full_precision,
    config = config.model.config,
    grid = config.model.grid,
    seamless = config.model.seamless,
    embedding_path = config.model.embedding_path,
    device_type = config.model.device_type
  )

  # TODO: get location from config
  image_storage_service = providers.ThreadSafeSingleton(
    services.ImageStorageService,
    './outputs/img-samples/'
  )

  # TODO: get location from config
  image_intermediates_storage_service = providers.ThreadSafeSingleton(
    services.ImageStorageService,
    './outputs/intermediates/'
  )

  signal_queue_service = providers.ThreadSafeSingleton(
    services.SignalQueueService
  )

  signal_service = providers.ThreadSafeSingleton(
    services.SignalService,
    socketio = socketio,
    queue = signal_queue_service
  )

  generation_queue_service = providers.ThreadSafeSingleton(
    services.JobQueueService
  )

  # TODO: get locations from config
  log_service = providers.ThreadSafeSingleton(
    services.LogService,
    './outputs/img-samples/',
    'dream_web_log.txt'
  )

  generator_service = providers.ThreadSafeSingleton(
    services.GeneratorService,
    model = model_singleton,
    queue = generation_queue_service,
    imageStorage = image_storage_service,
    intermediateStorage = image_intermediates_storage_service,
    log = log_service,
    signal_service = signal_service
  )
