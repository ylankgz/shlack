defmodule Shlack.LayoutView do
  use Shlack.Web, :view

  def show_flash(conn) do
    get_flash(conn) |> flash_msg
  end

  def flash_msg(%{"info" => msg}) do
    ~E"<div class='c-banner c-banner--success c-banner--unpinned'>
        <%= msg %>
        <i class='u-l-fr typcn typcn-delete' id='close-alert'></i>
       </div>"
  end

  def flash_msg(%{"error" => msg}) do
    ~E"<div class='c-banner c-banner--error u-mar-bottom-m c-banner--unpinned'>
        <%= msg %>
        <i class='u-l-fr typcn typcn-delete' id='close-alert'></i>
      </div>"
  end

  def flash_msg(_) do
    nil
  end
end
