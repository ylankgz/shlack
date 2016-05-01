defmodule Shlack.ViewHelpers do
  def active_on_current(%{request_path: path}, path), do: "active"
  def active_on_current(_, _), do: ""
  
  def logged_in?(conn), do: Guardian.Plug.authenticated?(conn)
  def current_user(conn), do: Guardian.Plug.current_resource(conn)

end