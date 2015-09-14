#!/usr/bin/env bash
_script()
{
  _script_commands=$(/vagrant/manage.sh autocomplete)

  local cur prev
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  COMPREPLY=( $(compgen -W "${_script_commands}" -- ${cur}) )

  return 0
}
#enable auto complete support for these
complete -o nospace -F _script /vagrant/manage.sh
complete -o nospace -F _script ./manage.sh
