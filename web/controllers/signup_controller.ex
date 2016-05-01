defmodule Shlack.SignupController do
  use Shlack.Web, :controller
  alias Shlack.User

  def new(conn, params, current_user, _claims) do
    render conn, "new.html", current_user: current_user
  end
end