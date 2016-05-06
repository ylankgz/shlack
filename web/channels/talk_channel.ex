defmodule Shlack.TalkChannel do
  use Shlack.Web, :channel
  alias Shlack.Talk
  import Guardian.Phoenix.Socket
  require Logger

  def join("talks:lobby", payload, socket) do
    if authorized?(payload) do
      send(self, :after_join)
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_info(:after_join, socket) do
    talks = Talk |> Talk.public |> Repo.all

    broadcast! socket, "talks_loaded", %{talks: talks}
    {:noreply, socket}
  end

  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  def handle_in("push_talk", payload, socket) do
    user = current_resource(socket)
    talk_params = %{ name: payload, moder_id: user.id }
    changeset = Talk.changeset(%Talk{}, talk_params)
    case Repo.insert(changeset) do
      {:ok, talk} ->  
        broadcast! socket, "talk_added", %{name: talk.name, id: talk.id, moder_id: talk.moder_id}

        {:noreply, socket}
      {:error, changeset} ->
        push socket, "add_talk_error", %{error: "Error. Talk name is taken ٩(×̯×)۶"}
        {:noreply, socket}
    end
  end

  def handle_out("leave_lobby", payload, socket) do
    push socket, "leave_lobby", payload
    {:noreply, socket}
  end
  
  def handle_out(event, payload, socket) do
    push socket, event, payload
    {:noreply, socket}
  end

  def terminate(msg, socket) do
    Logger.debug "RELOAD TALKS"

    broadcast! socket, "leave_lobby", %{msg: "Leave Lobby"}
    {:shutdown, :left}
  end

  defp authorized?(_payload) do
    true
  end
end