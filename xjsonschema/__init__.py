"""
An implementation of JSON Schema for Python

The main functionality is provided by the validator classes for each of the
supported JSON Schema versions.

Most commonly, :func:`validate` is the quickest way to simply validate a given
instance under a schema, and will create a validator for you.

"""

from xjsonschema.exceptions import (
    ErrorTree, FormatError, RefResolutionError, SchemaError, ValidationError
)
from xjsonschema._format import (
    FormatChecker, draft3_format_checker, draft4_format_checker,
)
from xjsonschema.validators import (
    Draft3Validator, Draft4Validator, RefResolver, validate
)


__version__ = "2.3.0"


# flake8: noqa
